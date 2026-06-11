from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    status_code = response.status_code
    data = response.data

    error_code = "error"
    message = "An error occurred."

    if isinstance(data, dict):
        if "detail" in data:
            detail = data.get("detail")

            if hasattr(detail, "code"):
                error_code = str(detail.code)

            message = str(detail)

        else:
            first_key = next(iter(data), None)

            if first_key:
                error_code = str(first_key)
                first_value = data[first_key]

                if isinstance(first_value, list) and first_value:
                    message = str(first_value[0])
                else:
                    message = str(first_value)

    elif isinstance(data, list) and data:
        message = str(data[0])

    response.data = {
        "error": error_code,
        "message": message,
        "status": status_code,
        "details": data,
    }

    return response