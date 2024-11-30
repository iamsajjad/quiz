

from django.urls import path
from question.views import q, p

urlpatterns = (

    # Question
    path('', q, name='q'),
    path('p/', p, name='p'),
)
