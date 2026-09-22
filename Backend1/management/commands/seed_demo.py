from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from Accounts.models import CompanyProfile, FarmerProfile, User
from contracts.models import Contract
from farmer.models import Crop
from negotiations.models import NegotiationOffer
from payments.models import EscrowAccount, Milestone
from monitoring.models import CropUpdate, Inspection


class Command(BaseCommand):
    help = "Create five repeatable AgriContract demo contracts and supporting records."

    @transaction.atomic
    def handle(self, *args, **options):
        farmer_specs = [
            ("Asha Verma", "asha.farmer@example.com", "Green Valley Farm"),
            ("Ravi Kumar", "ravi.farmer@example.com", "Kisan Fields"),
            ("Meena Patel", "meena.farmer@example.com", "Sunrise Organics"),
            ("Imran Khan", "imran.farmer@example.com", "Harvest House"),
            ("Pooja Singh", "pooja.farmer@example.com", "Riverbend Farm"),
        ]
        company, _ = User.objects.get_or_create(email="demo.buyer@example.com", defaults={"username": "demo.buyer@example.com", "role": "COMPANY"})
        company.set_password("DemoPass123!")
        company.role = "COMPANY"
        company.is_active = True
        company.save()
        company_profile, _ = CompanyProfile.objects.get_or_create(user=company, defaults={"company_name": "HarvestLink Foods", "business_type": "FOOD_PROCESSOR", "contact_person": "Neeraj Shah", "company_address": "Pune, Maharashtra"})

        crops = [("Tomato", "Arka Rakshak", "2026-01-15", "2026-04-30"), ("Onion", "N-53", "2026-02-01", "2026-06-15"), ("Wheat", "HD-2967", "2025-11-20", "2026-04-10"), ("Potato", "Kufri Jyoti", "2026-01-05", "2026-04-20"), ("Turmeric", "Salem", "2025-12-15", "2026-08-15")]
        statuses = ["ACTIVE", "AGREED", "NEGOTIATING", "DRAFT", "COMPLETED"]
        created = []
        for index, ((name, variety, sowing, harvest), (full_name, email, farm_name)) in enumerate(zip(crops, farmer_specs), start=1):
            username = email
            farmer, _ = User.objects.get_or_create(email=email, defaults={"username": username, "role": "FARMER"})
            farmer.set_password("DemoPass123!")
            farmer.role = "FARMER"
            farmer.is_active = True
            farmer.save()
            profile, _ = FarmerProfile.objects.get_or_create(user=farmer, defaults={"farm_name": farm_name, "address": "Demo agricultural area", "state": "Maharashtra", "district": "Pune", "land_size_acres": Decimal("12.50"), "khasra_number": f"DEMO-{index}"})
            crop, _ = Crop.objects.get_or_create(farmer=profile, name=name, variety=variety, defaults={"expected_quantity": Decimal(100 + index * 20), "expected_price": Decimal(20 + index * 5), "sowing_date": date.fromisoformat(sowing), "expected_harvest_date": date.fromisoformat(harvest), "description": "Seeded demonstration crop"})
            contract, _ = Contract.objects.get_or_create(crop=crop, company=company_profile, defaults={"farmer": profile, "agreed_quantity": crop.expected_quantity, "agreed_price": crop.expected_price, "status": statuses[index - 1]})
            account, _ = EscrowAccount.objects.get_or_create(contract=contract, defaults={"total_amount": crop.expected_price * crop.expected_quantity, "status": "FUNDED" if index < 4 else "UNFUNDED"})
            milestone, _ = Milestone.objects.get_or_create(contract=contract, sequence=1, defaults={"name": "Contract delivery", "amount": crop.expected_price * crop.expected_quantity, "status": "FUNDED" if account.status == "FUNDED" else "PENDING", "due_date": crop.expected_harvest_date})
            CropUpdate.objects.get_or_create(crop=crop, contract=contract, stage="GROWING", defaults={"completion_percent": min(95, 35 + index * 10), "notes": "Seeded field progress update", "latitude": Decimal("18.520400"), "longitude": Decimal("73.856700")})
            Inspection.objects.get_or_create(contract=contract, defaults={"status": "REQUESTED", "notes": "Seeded inspection request"})
            NegotiationOffer.objects.get_or_create(contract=contract, offered_by=company, defaults={"offered_price": crop.expected_price})
            created.append(contract.id)

        self.stdout.write(self.style.SUCCESS(f"Demo data ready: {len(created)} contracts ({', '.join(map(str, created))})."))
        self.stdout.write("Demo login: demo.buyer@example.com / DemoPass123!")
        self.stdout.write("Farmer logins use the same password: DemoPass123!")
