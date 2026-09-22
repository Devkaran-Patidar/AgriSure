from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from Accounts.models import CompanyProfile, FarmerProfile, User
from contracts.models import Contract
from farmer.models import Crop
from negotiations.models import NegotiationOffer
from payments.models import EscrowAccount, Milestone
from monitoring.models import CropUpdate, Inspection
from communications.models import Notification, Message


class Command(BaseCommand):
    help = "Create five repeatable AgriContract demo contracts and supporting records."

    @transaction.atomic
    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(email="admin@gmail.com", defaults={"username": "admin@gmail.com", "role": "ADMIN"})
        admin.set_password("12345678")
        admin.role, admin.is_active, admin.is_staff = "ADMIN", True, True
        admin.save()
        farmer_specs = [
            ("asha.farmer@example.com", "Green Valley Farm"),
            ("ravi.farmer@example.com", "Kisan Fields"),
            ("meena.farmer@example.com", "Sunrise Organics"),
            ("imran.farmer@example.com", "Harvest House"),
            ("pooja.farmer@example.com", "Riverbend Farm"),
        ]
        company, _ = User.objects.get_or_create(email="demo.buyer@example.com", defaults={"username": "demo.buyer@example.com", "role": "COMPANY"})
        company.set_password("DemoPass123!")
        company.role, company.is_active = "COMPANY", True
        company.save()
        company_profile, _ = CompanyProfile.objects.get_or_create(user=company, defaults={"company_name": "HarvestLink Foods", "business_type": "FOOD_PROCESSOR", "contact_person": "Neeraj Shah", "company_address": "Pune, Maharashtra"})
        crops = [("Tomato", "Arka Rakshak", "2026-01-15", "2026-04-30"), ("Onion", "N-53", "2026-02-01", "2026-06-15"), ("Wheat", "HD-2967", "2025-11-20", "2026-04-10"), ("Potato", "Kufri Jyoti", "2026-01-05", "2026-04-20"), ("Turmeric", "Salem", "2025-12-15", "2026-08-15")]
        statuses = ["ACTIVE", "AGREED", "NEGOTIATING", "DRAFT", "COMPLETED"]
        ids = []
        for index, ((name, variety, sowing, harvest), (email, farm_name)) in enumerate(zip(crops, farmer_specs), start=1):
            farmer, _ = User.objects.get_or_create(email=email, defaults={"username": email, "role": "FARMER"})
            farmer.set_password("DemoPass123!")
            farmer.role, farmer.is_active = "FARMER", True
            farmer.save()
            profile, _ = FarmerProfile.objects.get_or_create(user=farmer, defaults={"farm_name": farm_name, "address": "Demo agricultural area", "state": "Maharashtra", "district": "Pune", "land_size_acres": Decimal("12.50"), "khasra_number": f"DEMO-{index}"})
            crop, _ = Crop.objects.get_or_create(farmer=profile, name=name, variety=variety, defaults={"expected_quantity": Decimal(100 + index * 20), "expected_price": Decimal(20 + index * 5), "sowing_date": date.fromisoformat(sowing), "expected_harvest_date": date.fromisoformat(harvest), "description": "Seeded demonstration crop"})
            contract, _ = Contract.objects.get_or_create(crop=crop, company=company_profile, defaults={"farmer": profile, "agreed_quantity": crop.expected_quantity, "agreed_price": crop.expected_price, "status": statuses[index - 1]})
            account, _ = EscrowAccount.objects.get_or_create(contract=contract, defaults={"total_amount": crop.expected_price * crop.expected_quantity, "status": "FUNDED" if index < 4 else "UNFUNDED"})
            Milestone.objects.get_or_create(contract=contract, sequence=1, defaults={"name": "Contract delivery", "amount": crop.expected_price * crop.expected_quantity, "status": "FUNDED" if account.status == "FUNDED" else "PENDING", "due_date": crop.expected_harvest_date})
            CropUpdate.objects.get_or_create(crop=crop, contract=contract, stage="GROWING", defaults={"completion_percent": min(95, 35 + index * 10), "notes": "Seeded field progress update", "latitude": Decimal("18.520400"), "longitude": Decimal("73.856700")})
            Inspection.objects.get_or_create(contract=contract, defaults={"status": "REQUESTED", "notes": "Seeded inspection request"})
            NegotiationOffer.objects.get_or_create(contract=contract, offered_by=company, defaults={"offered_price": crop.expected_price})
            Notification.objects.get_or_create(user=farmer, title=f"Contract #{contract.id} update", defaults={"message": f"Your {name} contract is currently {contract.status}.", "notification_type": "CONTRACT"})
            Message.objects.get_or_create(sender=company, recipient=farmer, subject=f"Contract #{contract.id} coordination", defaults={"body": f"Please review the latest {name} delivery details."})
            ids.append(contract.id)
        self.stdout.write(self.style.SUCCESS(f"Demo data ready: {len(ids)} contracts ({', '.join(map(str, ids))})."))
        self.stdout.write("Demo admin: admin@gmail.com / 12345678")
        self.stdout.write("Demo company: demo.buyer@example.com / DemoPass123!")
        self.stdout.write("Demo farmers use their email and password DemoPass123!")
