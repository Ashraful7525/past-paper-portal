import bcrypt from 'bcryptjs';

const hashPassword = async () => {
  const hash1 = await bcrypt.hash("fahim", 12);
  const hash2 = await bcrypt.hash("tahmid", 12);
  console.log("fahim:", hash1);
  console.log("tahmid:", hash2);
};

hashPassword();
