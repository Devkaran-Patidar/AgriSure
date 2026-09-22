from rest_framework import serializers
from .models import EscrowAccount, FundingTransaction, Milestone


class FundingTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingTransaction
        fields = ["id", "amount", "transaction_type", "status", "reference", "created_at"]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "name", "amount", "sequence", "due_date", "status", "released_at"]
        read_only_fields = ["status", "released_at"]


class EscrowAccountSerializer(serializers.ModelSerializer):
    contract_id = serializers.IntegerField(source="contract.id", read_only=True)
    contract_status = serializers.CharField(source="contract.status", read_only=True)
    crop_name = serializers.CharField(source="contract.crop.name", read_only=True)
    farmer_name = serializers.CharField(source="contract.farmer.farm_name", read_only=True)
    company_name = serializers.CharField(source="contract.company.company_name", read_only=True)
    contract_title = serializers.SerializerMethodField()
    transactions = FundingTransactionSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(source="contract.payment_milestones", many=True, read_only=True)

    class Meta:
        model = EscrowAccount
        fields = [
            "id", "contract_id", "contract_title", "crop_name", "farmer_name", "company_name",
            "contract_status", "total_amount", "status", "funded_at", "updated_at",
            "transactions", "milestones",
        ]
        read_only_fields = ["status", "funded_at", "updated_at"]

    def get_contract_title(self, obj):
        crop = obj.contract.crop.name
        farmer = obj.contract.farmer.farm_name
        company = obj.contract.company.company_name
        return f"{crop} · {farmer} ↔ {company}"
