"""Unit tests: security primitives."""
import pytest

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_api_key,
    hash_api_key,
    hash_password,
    verify_api_key,
    verify_password,
)


def test_password_hash_and_verify():
    h = hash_password("supersecret")
    assert h != "supersecret"
    assert verify_password("supersecret", h)
    assert not verify_password("wrong", h)


def test_jwt_access_roundtrip():
    tok = create_access_token("user-123")
    payload = decode_token(tok)
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_jwt_refresh_has_longer_exp():
    refresh = decode_token(create_refresh_token("u1"))
    assert refresh["type"] == "refresh"
    assert refresh["exp"] > decode_token(create_access_token("u1"))["exp"]


def test_jwt_rejects_wrong_secret():
    tok = create_access_token("u1")
    from app.core.config import settings

    with pytest.raises(Exception):
        decode_token(tok.replace(tok[-3:], "xyz"))


def test_api_key_unique_and_verifiable():
    p1, k1 = generate_api_key()
    p2, k2 = generate_api_key()
    assert p1 != p2 and k1 != k2
    assert verify_api_key(k1, hash_api_key(k1))
    assert not verify_api_key(k2, hash_api_key(k1))
