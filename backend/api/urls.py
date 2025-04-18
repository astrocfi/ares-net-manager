from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OperatorViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'operators', OperatorViewSet)
router.register(r'activity-logs', ActivityLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]