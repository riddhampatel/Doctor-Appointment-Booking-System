// import jwt from "jsonwebtoken";

// // user aythentication middleware

// const authUser = async (req, res, next) => {
//   try {
//     const { token } = req.headers;
//     if (!token) {
//       return res.json({
//         success: false,
//         message: "Not Authorized Login Again",
//       });
//     }
//     const token_decode = jwt.verify(token, process.env.JWT_SECRET);

//     req.body.userId = token_decode.id

//     next();

//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };
// export default authUser;


import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    // Get token from headers
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to req for later use in routes
    req.userId = decodedToken.id;

    next(); // Continue to the next middleware/route
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

export default authUser;
