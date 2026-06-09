from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]


# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MTExOTQ2MywiaWF0IjoxNzgxMDMzMDYzLCJqdGkiOiI3YzhiMzBkYjk5YzM0MjJjYjg2NGQ0N2E1NGE1NGRjMyIsInVzZXJfaWQiOiIxIn0.lhJM399zMlHoMWTXXFrdLbvWhXiSMcE8iet5Qz1N65U





# Invoke-RestMethod `
#   -Uri "http://127.0.0.1:8000/api/v1/auth/token/refresh/" `
#   -Method POST `
#   -ContentType "application/json" `
#   -Body '{
#     "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MTExOTYwNywiaWF0IjoxNzgxMDMzMjA3LCJqdGkiOiJhODU5NWZhYTZiZjM0MGMzYWE3MGQ5M2U1MWQwYjhkMCIsInVzZXJfaWQiOiIxIn0.5Nqmczjp1o50d1hxaDAdOr8YOGRjDRci0yYmvfMoMwQ"
#   }'