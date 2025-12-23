import time
from random import randint

import redis

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)


def random_code():
    return randint(100_000, 999_999)


def _get_login_key(phone):
    return f"login:{phone}"


def send_sms_code(phone: str, code: int, ttl_seconds=60):
    redis_key = f"login:{phone}"
    data = redis_client.hgetall(redis_key)
    if data:
        sent_at = float(data.get("sent_at"))
        passed = time.time() - sent_at
        remain = int(ttl_seconds - passed)

        if remain > 0:
            return {
                "allowed": False,
                "remain_seconds": remain
            }
    print(f"[TEST] Phone: {phone}, Code: {code}")
    redis_client.hmset(redis_key, {
        "sent_at": time.time(),
        "code": code
    })
    redis_client.expire(redis_key, ttl_seconds)

    return {
        "allowed": True,
        "remain_seconds": 0
    }


def check_sms_code(phone: str, code: int):
    redis_key = f"login:{phone}"
    data = redis_client.hgetall(redis_key)

    if not data:
        return False

    saved_code = data.get("code")
    print(saved_code, code)

    return str(saved_code) == str(code)
