// import validator from "validator";
// import bcrypt from "bcrypt";
// import userModel from "../models/userModel.js";
// import jwt from "jsonwebtoken";
// // API to register user

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !password || !email) {
//       return res.json({ success: false, message: "Missing Details" });
//     }

//     // valadating email formate
//     if (!validator.isEmail(email)) {
//       return res.json({ success: false, message: "Entart a Valid Email" });
//     }

//     // validating a strong password
//     if (password.length < 8) {
//       return res.json({ success: false, message: " Enatr a Strong password" });
//     }

//     // hasing user password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const userData = {
//       name,
//       email,
//       password: hashedPassword,
//     };

//     const newUser = new userModel(userData);

//     const user = await newUser.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

//     res.json({ success: true, token });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API for user login

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({ success: false, message: "User does not exist" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (isMatch) {
//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//       res.json({ success: true, token });
//     } else {
//       res.json({ success: false, message: "Inavalid Credentials" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to get user profile data

// const getProfile = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const userData = await userModel.findById(userId).select("-password");

//     res.json({ success: true, userData });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export { registerUser, loginUser, getProfile };

import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    // ✅ Use req.userId from auth middleware, not req.body
    const userId = req.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found" });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to update user profile

// const updateProfile = async (req,res)=>{
//   try {

//     const { name , phone , address, dob , gender} = req.body
//     const imageFile = req.file
//     const userId = req.userId; // Use userId from auth middleware

//     if (!name || !phone || !dob || !gender ) {
//       return res.json({success:false,message:"Data Missing"})
//     }

//     await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})

//     // Send response immediately after updating profile data
//     res.json({success:true,message:"Profile Updated"})

//     // Handle image upload asynchronously if present
//     if (imageFile) {
//       try {
//         // Upload image to cloudinary
//         const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
//         const imageURL = imageUpload.secure_url
//         await userModel.findByIdAndUpdate(userId,{image:imageURL})
//       } catch (uploadError) {
//         console.log("Image upload failed:", uploadError);
//         // Optionally, you could log this or notify the user later, but don't fail the profile update
//       }
//     }

//   } catch (error) {
//     console.log(error);
//     res.json({success:false,message:error.message})

//   }
// }

// this is new logic updateprofile code  till 260
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    const userId = req.userId; // from auth middleware

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    // update basic profile
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: address ? JSON.parse(address) : {},
      dob,
      gender,
    });

    // upload image if exists
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      await userModel.findByIdAndUpdate(userId, {
        image: imageUpload.secure_url,
      });
    }

    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, getProfile, updateProfile };
