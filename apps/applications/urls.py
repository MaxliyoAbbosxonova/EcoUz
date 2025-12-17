from django.conf.urls.static import static

from root.settings import MEDIA_URL, MEDIA_ROOT

urlpatterns=[

]+ static(MEDIA_URL, document_root=MEDIA_ROOT)