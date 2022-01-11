const jwt = require("jsonwebtoken");

const signJWT = async (value: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(value, process.env.SERVER_SECRET, (err, encoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(encoded);
      }
    });
  });
};

const verifyJWT = async (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SERVER_SECRET, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
};

export { signJWT, verifyJWT };
