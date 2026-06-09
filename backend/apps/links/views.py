from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.links.serializers import LinkCreateSerializer


class LinkCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LinkCreateSerializer(data = request.data, context={"request": request})

        if serializer.is_valid():
            link = serializer.save()

            return Response(
                LinkCreateSerializer(link,context = {"request": request}).data,
                status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)