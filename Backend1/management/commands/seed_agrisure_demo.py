from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from Accounts.models import CompanyProfile, FarmerProfile, User
from contracts.models import Contract
from farmer.models import Crop
from negotiations.models import NegotiationOffer
from payments.models import EscrowAccount, FundingTransaction, Milestone
from payments.views import get_or_create_account


class Command(BaseCommand):
    help = "Create an idempotent AgriSure workflow demo: 4 farmers, 2 buyers, 10 crops, and staged contracts."

    password = "DemoPass123!"

    @transaction.atomic
    def handle(self, *args, **options):
        farmers = [
            ("Asha", "Verma", "asha.demo@agrisure.test", "Green Valley Farm"),
            ("Ravi", "Kumar", "ravi.demo@agrisure.test", "Kisan Fields"),
            ("Meena", "Patel", "meena.demo@agrisure.test", "Sunrise Organics"),
            ("Imran", "Khan", "imran.demo@agrisure.test", "Harvest House"),
        ]
        buyers = [
            ("HarvestLink Foods", "buyer.one@agrisure.test"),
            ("FreshRoute Markets", "buyer.two@agrisure.test"),
        ]

        self.admin()
        farmer_profiles = [self.farmer(*spec, index=index) for index, spec in enumerate(farmers, start=1)]
        buyer_profiles = [self.buyer(*spec) for spec in buyers]
        crops = self.create_crops(farmer_profiles)

        completed_one = self.contract(crops[0], buyer_profiles[0], "COMPLETED", Decimal("32"), approvals=True, signed=True)
        completed_two = self.contract(crops[1], buyer_profiles[1], "COMPLETED", Decimal("41"), approvals=True, signed=True)
        active = self.contract(crops[2], buyer_profiles[0], "ACTIVE", Decimal("29"), approvals=True, signed=True)
        agreed = self.contract(crops[3], buyer_profiles[1], "AGREED", Decimal("36"), approvals=True)
        negotiating = self.contract(crops[4], buyer_profiles[1], "NEGOTIATING", Decimal("27"), approvals=True)
        draft = self.contract(crops[5], buyer_profiles[0], "DRAFT", Decimal("24"))

        NegotiationOffer.objects.update_or_create(
            contract=negotiating,
            offered_by=buyer_profiles[1].user,
            defaults={"offered_price": Decimal("31"), "status": "PENDING"},
        )

        self.configure_payments(completed_one, "RELEASED")
        self.configure_payments(completed_two, "RELEASED")
        self.configure_payments(active, "PARTIALLY_RELEASED")
        self.configure_payments(agreed, "UNFUNDED")
        self.configure_payments(negotiating, "UNFUNDED")
        self.configure_payments(draft, "UNFUNDED")

        self.stdout.write(self.style.SUCCESS("AgriSure demo data ready."))
        self.stdout.write("Farmers: asha.demo@agrisure.test, ravi.demo@agrisure.test, meena.demo@agrisure.test, imran.demo@agrisure.test")
        self.stdout.write("Buyers: buyer.one@agrisure.test, buyer.two@agrisure.test")
        self.stdout.write("Password for all demo users: DemoPass123!")
        self.stdout.write("Admin: admin.demo@agrisure.test / AdminDemo123!")
        self.stdout.write("Contracts: 2 completed, 1 active, 1 agreed, 1 negotiating, 1 draft; 4 crops available.")

    def admin(self):
        user, _ = User.objects.get_or_create(email="admin.demo@agrisure.test", defaults={"username": "admin.demo@agrisure.test"})
        user.username = "admin.demo@agrisure.test"
        user.first_name = "AgriSure"
        user.last_name = "Admin"
        user.role = "ADMIN"
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.is_verified = True
        user.set_password("AdminDemo123!")
        user.save()

    def farmer(self, first_name, last_name, email, farm_name, index):
        user, _ = User.objects.get_or_create(email=email, defaults={"username": email})
        user.username = email
        user.first_name = first_name
        user.last_name = last_name
        user.role = "FARMER"
        user.is_active = True
        user.is_verified = True
        user.set_password(self.password)
        user.save()
        profile, _ = FarmerProfile.objects.get_or_create(
            user=user,
            defaults={
                "farm_name": farm_name,
                "address": "AgriSure demonstration area",
                "state": "Maharashtra",
                "district": "Pune",
                "land_size_acres": Decimal("12.50"),
                "khasra_number": f"DEMO-{index}",
            },
        )
        profile.farm_name = farm_name
        profile.address = "AgriSure demonstration area"
        profile.state = "Maharashtra"
        profile.district = "Pune"
        profile.land_size_acres = Decimal("12.50")
        profile.khasra_number = f"DEMO-{index}"
        profile.verification_status = "VERIFIED"
        profile.save()
        return profile

    def buyer(self, company_name, email):
        user, _ = User.objects.get_or_create(email=email, defaults={"username": email})
        user.username = email
        user.first_name = company_name.split()[0]
        user.role = "COMPANY"
        user.is_active = True
        user.is_verified = True
        user.set_password(self.password)
        user.save()
        profile, _ = CompanyProfile.objects.get_or_create(
            user=user,
            defaults={
                "company_name": company_name,
                "business_type": "FOOD_PROCESSOR",
                "contact_person": "AgriSure Demo Buyer",
                "company_address": "Pune, Maharashtra",
            },
        )
        profile.company_name = company_name
        profile.business_type = "FOOD_PROCESSOR"
        profile.contact_person = "AgriSure Demo Buyer"
        profile.company_address = "Pune, Maharashtra"
        profile.verification_status = "VERIFIED"
        profile.save()
        return profile

    def create_crops(self, farmer_profiles):
        crop_specs = [
            ("Tomato", "Arka Rakshak"),
            ("Onion", "N-53"),
            ("Wheat", "HD-2967"),
            ("Potato", "Kufri Jyoti"),
            ("Turmeric", "Salem"),
            ("Soybean", "JS-9560"),
            ("Maize", "PMH-1"),
            ("Chickpea", "JG-11"),
            ("Cotton", "Bt Cotton"),
            ("Rice", "Basmati"),
        ]
        crops = []
        for index, (name, variety) in enumerate(crop_specs):
            profile = farmer_profiles[index % len(farmer_profiles)]
            crop, _ = Crop.objects.get_or_create(
                farmer=profile,
                name=name,
                variety=variety,
                defaults={
                    "expected_quantity": Decimal("100") + (index * Decimal("10")),
                    "minimum_contract_quantity": Decimal("20"),
                    "expected_price": Decimal("20") + index,
                    "sowing_date": date(2026, 1, 1) + timedelta(days=index * 5),
                    "expected_harvest_date": date(2026, 5, 1) + timedelta(days=index * 5),
                    "delivery_location": "Pune Collection Centre",
                    "description": "AgriSure workflow demonstration crop",
                },
            )
            crop.expected_quantity = Decimal("100") + (index * Decimal("10"))
            crop.minimum_contract_quantity = Decimal("20")
            crop.expected_price = Decimal("20") + index
            crop.sowing_date = date(2026, 1, 1) + timedelta(days=index * 5)
            crop.expected_harvest_date = date(2026, 5, 1) + timedelta(days=index * 5)
            crop.delivery_location = "Pune Collection Centre"
            crop.description = "AgriSure workflow demonstration crop"
            crop.save()
            crops.append(crop)
        return crops

    def contract(self, crop, buyer, status, price, approvals=False, signed=False):
        contract, _ = Contract.objects.update_or_create(
            crop=crop,
            defaults={
                "farmer": crop.farmer,
                "company": buyer,
                "agreed_quantity": crop.minimum_contract_quantity,
                "agreed_price": price,
                "delivery_location": crop.delivery_location,
                "payment_terms": "20% advance after both signatures; 80% after delivery",
                "terms_conditions": "Demonstration agreement for the AgriSure workflow.",
                "status": status,
            },
        )
        now = timezone.now()
        contract.farmer_approved_at = now if approvals else None
        contract.company_approved_at = now if approvals else None
        contract.farmer_signed_at = now if signed else None
        contract.company_signed_at = now if signed else None
        contract.delivery_at = now - timedelta(days=2) if status == "COMPLETED" else None
        contract.save()
        return contract

    def configure_payments(self, contract, account_status):
        account = get_or_create_account(contract)
        total = contract.total_amount
        account.total_amount = total
        account.status = account_status
        account.funded_at = timezone.now() if account_status != "UNFUNDED" else None
        account.save()
        milestones = {milestone.sequence: milestone for milestone in contract.payment_milestones.all()}
        for sequence, amount, name in (
            (1, total * Decimal("0.20"), "20% advance"),
            (2, total * Decimal("0.80"), "80% after delivery"),
        ):
            milestone = milestones[sequence]
            milestone.name = name
            milestone.amount = amount
            milestone.status = (
                "RELEASED"
                if account_status == "RELEASED" or (account_status == "PARTIALLY_RELEASED" and sequence == 1)
                else "FUNDED"
                if account_status in ("FUNDED", "PARTIALLY_RELEASED")
                else "PENDING"
            )
            milestone.released_at = timezone.now() if milestone.status == "RELEASED" else None
            milestone.save()
        FundingTransaction.objects.filter(account=account).delete()
        if account_status != "UNFUNDED":
            FundingTransaction.objects.create(account=account, amount=total, transaction_type="FUNDING", reference="demo escrow")
        if account_status in ("PARTIALLY_RELEASED", "RELEASED"):
            FundingTransaction.objects.create(account=account, amount=total * Decimal("0.20"), transaction_type="RELEASE", reference="demo 20% advance")
        if account_status == "RELEASED":
            FundingTransaction.objects.create(account=account, amount=total * Decimal("0.80"), transaction_type="RELEASE", reference="demo 80% final payment")
