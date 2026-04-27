import bcrypt

from application.security.password_hasher import PasswordHasher


class BcryptPasswordHasher(PasswordHasher):
    def hash(self, plain_password: str) -> str:
        password_bytes = plain_password.encode("utf-8")
        return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")

    def verify(self, plain_password: str, password_hash: str) -> bool:
        password_bytes = plain_password.encode("utf-8")
        hash_bytes = password_hash.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hash_bytes)
