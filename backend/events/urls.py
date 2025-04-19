from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)
router.register(r'networks', views.NetworkViewSet)
router.register(r'event-operators', views.EventOperatorViewSet)
router.register(r't-card-columns', views.TCardColumnViewSet)
router.register(r't-cards', views.TCardViewSet)
router.register(r't-card-activities', views.TCardActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]