from rest_framework.serializers import ModelSerializer
from .models import Application



class ApplicationSerializer(ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

    def get_map_url(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None
