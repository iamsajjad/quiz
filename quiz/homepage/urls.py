
from django.urls import path
from homepage.views import homepage

urlpatterns = (

    # Homepage
    path('', homepage, name='homepage'),
)
