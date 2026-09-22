from rest_framework import serializers
from .models import Crop

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'
        read_only_fields = ['farmer']

    def create(self, validated_data):
        # Automatically set the farmer to the logged-in user's farmer profile
        user = self.context['request'].user
        if not hasattr(user, 'farmer_profile'):
            raise serializers.ValidationError("User does not have a farmer profile.")
        validated_data['farmer'] = user.farmer_profile
        return super().create(validated_data)
