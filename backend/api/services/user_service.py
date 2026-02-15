from django.core.exceptions import ObjectDoesNotExist
from api.models import User
from api.serializers import UserCreateSerializer, UserUpdateSerializer


# CREATE
def create_user(data) -> User:
    serializer = UserCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()

# READ
def get_user_by_id(user_id) -> User:
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ObjectDoesNotExist("User not found")


def get_user_by_email(email: str) -> User:
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        raise ObjectDoesNotExist("User not found")


# UPDATE
def update_user_by_id(user: User, data) -> User:
    serializer = UserUpdateSerializer(
        user,
        data=data,
        partial=True
    )
    serializer.is_valid(raise_exception=True)
    return serializer.save()


# DELETE
def delete_user_by_id(user: User) -> None:
    user.delete()
