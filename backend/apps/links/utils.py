import random
import string


SLUG_LENGTH = 6
SLUG_CHARACTERS = string.ascii_letters + string.digits

MAX_SLUG_GENERATION_ATTEMPTS = 10

# Generate a random alphanumeric slug.
def generate_slug(length = SLUG_LENGTH):
    return "".join(
        random.choices(SLUG_CHARACTERS, k = length)
    )

# Generate a unique slug for the given model.
def generate_unique_slug(model_class, length=SLUG_LENGTH):
    for i in range(MAX_SLUG_GENERATION_ATTEMPTS):
        slug = generate_slug(length = length)

        if not model_class.objects.filter(slug = slug).exists():
            return slug

    raise RuntimeError("Could not generate a unique slug.")