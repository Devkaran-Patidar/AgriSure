from rest_framework import serializers
from .models import Contract
from farmer.serializers import CropSerializer

class ContractSerializer(serializers.ModelSerializer):
    crop_details = CropSerializer(source='crop', read_only=True)
    farmer_name = serializers.CharField(source='farmer.farm_name', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    farmer_details = serializers.SerializerMethodField()
    company_details = serializers.SerializerMethodField()
    fully_signed = serializers.BooleanField(source='is_fully_signed', read_only=True)

    class Meta:
        model = Contract
        fields = '__all__'
        read_only_fields = ['farmer', 'company', 'status']

    def get_farmer_details(self, obj):
        return {"id": obj.farmer.user_id, "name": obj.farmer.user.get_full_name(), "email": obj.farmer.user.email, "farm_name": obj.farmer.farm_name, "district": obj.farmer.district, "state": obj.farmer.state}

    def get_company_details(self, obj):
        return {"id": obj.company.user_id, "name": obj.company.user.get_full_name(), "email": obj.company.user.email, "company_name": obj.company.company_name, "contact_person": obj.company.contact_person}

    def create(self, validated_data):
        user = self.context['request'].user
        
        if user.role != 'COMPANY':
            raise serializers.ValidationError("Only companies can initiate a contract request.")
            
        validated_data['company'] = user.company_profile
        validated_data['farmer'] = validated_data['crop'].farmer
        validated_data['status'] = 'DRAFT'
        contract = super().create(validated_data)
        from communications.models import Notification
        Notification.objects.create(user=contract.farmer.user, title=f"New contract request #{contract.id}", message=f"{contract.company.company_name} sent a contract request for {contract.crop.name}.", notification_type="CONTRACT")
        from payments.views import get_or_create_account
        get_or_create_account(contract)
        return contract
