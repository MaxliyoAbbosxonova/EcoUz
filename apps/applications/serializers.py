from rest_framework.fields import SerializerMethodField, CharField, ImageField
from rest_framework.serializers import ModelSerializer
from .models import Application, Region, District


class ApplicationModelSerializer(ModelSerializer):
    region_name = CharField(source="region.name", read_only=True)
    district_name = CharField(source="district.name", read_only=True)
    class Meta:
        model = Application
        fields =( "id",
            "created_at",
            "image",
            "fullname",
            "phone",
            "description",
            "latitude",
            "longitude",
            "status",
            "region_name",
            "district_name")

    def get_map_url(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None

class RegionModelSerializer(ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

class DistrictModelSerializer(ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'