import re

from rest_framework.exceptions import ValidationError
from rest_framework.fields import SerializerMethodField, DecimalField
from rest_framework.serializers import ModelSerializer

from .models import Application, Region, District, Highlight, Result


class ApplicationModelSerializer(ModelSerializer):
    latitude = DecimalField(max_digits=9, decimal_places=7)
    longitude = DecimalField(max_digits=9, decimal_places=7)
    region_name = SerializerMethodField()
    district_name = SerializerMethodField()

    class Meta:
        model = Application
        fields = ("id",
                  "created_at",
                  "image",
                  "fullname",
                  "phone",
                  "description",
                  "region",
                  "district",
                  "latitude",
                  "longitude",
                  "status",
                  "region_name",
                  "district_name",
                  )

    def get_region_name(self, obj):
        return obj.region.name

    def get_district_name(self, obj):
        return obj.district.name

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return {"url": request.build_absolute_uri(obj.image.url)}
            return {"url": obj.image.url}
        return None

    def validate_phone(self, value):
        digits = re.findall(r'\d', value)
        if len(digits) < 9:
            raise ValidationError('Phone number must be at least 9 digits')
        phone = ''.join(digits)
        return phone.removeprefix('998')

    def get_map_url(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None


class OperatorAssignModelSerializer(ModelSerializer):
    region_name = SerializerMethodField()
    district_name = SerializerMethodField()

    class Meta:
        model = Application
        fields = "__all__"

    def get_region_name(self, obj):
        return obj.region.name

    def get_district_name(self, obj):
        return obj.district.name


class RegionModelSerializer(ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'


class DistrictModelSerializer(ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'


class HighlightModelSerializer(ModelSerializer):
    class Meta:
        model = Highlight
        fields = ('id', 'name', 'image', 'created_at')

#
# class ImagesModelSerializer(ModelSerializer):
#     class Meta:
#         model = Image
#         fields = ("id", "image","result")


class ResultModelSerializer(ModelSerializer):

    class Meta:
        model = Result
        fields = "__all__"
