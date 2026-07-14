import user from "../Schemas/userSchema.js"; // Please never forget the extention I spent a while realising that
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ------------------------------------------- Helper Functions -------------------------------------------

// Use this to validate the incoming string is valid to be a username :: true when usename is invalid
async function isInvalid(str) {
  const regx = /[\W\s]/;
  // \W - is the string is anything other than a-z A-Z 0-9 _
  // \s - does the string has any whitespace characters

  // Check if the user already exist
  const found = await user.findOne({ UserName: str });

  if (found) return "User already exists";

  // check if it follows the nomanclature
  if (str.length > 20 || str.length < 3)
    return "User Name must be between 4 and 20 letters";

  if (regx.test(str))
    return "User name must not have spaces and special characters other than _";

  return false;
}

// Password strength Check :: true when password is weak
function checkStrength(str) {
  /*
  ^: Asserts the start of the string. It forces the regex engine to begin checking from the very first character.
  $: Asserts the end of the string. This ensures the pattern must validate the entire string from start to finish.
  .*: The dot . means "any character (except newline)", and the asterisk * means "zero or more times".
         Placed inside the lookaheads,
         it allows the engine to scan past any characters until it finds a match for the rule that follows.
  (?=.*[a-z]): Lowercase Letter Check
  (?=.*[A-Z]): Uppercase Letter Check
  (?=.*\d): Digit Check
  (?=.*[-+_!@#$%^&*., ?]): Special Character & Space Check
         Note on structure: The hyphen - is intentionally placed at the very beginning. Inside a character class,
         placing - anywhere else can accidentally create a range (like a-z), but placing it first makes it a literal hyphen.
  */

  const regx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-+_!@#$%^&*., ?]).+$/;
  if (str.length < 8) return true; // Length Check
  if (!regx.test(str)) return true; // Check if the password is strong
  return false;
}

// Encrypt the Password :: returns hashed password
async function haspassword(str) {
  const saltRound = parseInt(process.env.SALT_ROUNDS) || 10;
  return await bcrypt.hash(str, saltRound);
}

// in case in future I do something crazy ensure it returns false when comparision fails
// Use it in login section to compare password
async function comparePassword(pass, hash) {
  // bcrypt.compare returns a Promise if you don't provide a callback!
  try {
    const isMatch = await bcrypt.compare(pass, hash);
    return isMatch; // This will actually be true or false
  } catch (err) {
    return false;
  }
}

async function JWT_Producer(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
// ------------------------------------------- Routes -------------------------------------------

export async function signUpUser(req, res) {
  console.log("triggered signUpUser", req?.body);

  try {
    const messageE =
      "User name must have between 2 and 20 letters\nit should not contain any space or specail characters\nIt must be unique\nAnd the Password must be atleast 8 letters long and have capital letter lower case letter a digit and a special charactor";

    // Check if they actually sent data
    if (!req?.body?.user || !req?.body?.pass) {
      return res.status(400).json({
        error: "Missing fields",
        message: "Username and Password are required",
        value:
          "Password and user name both is required, Reminder to add check in the front end!!",
      });
    }

    const newUser = req.body.user;
    const Password = req.body.pass;

    // Check the password strength
    let error = await checkStrength(Password);

    // Checking user availablity after checking  the pass as checking user sends load to database
    if (!error)
      // Check if the username is valid if Password was valid to save the backend processing
      error = await isInvalid(newUser);

    // Here we check return the validity
    // A valid user will always have a false error any other value is assumed to be true error
    if (error !== false)
      return res.status(400).json({
        error: "Invalid User name or Password",
        message: messageE,
      });

    // Hash the password and add user safely now
    const hashedPassword = await haspassword(Password);

    const User = new user({
      UserName: newUser,
      Password: hashedPassword,
    });

    await User.save();
    console.log("Success in Signup", User);
    return res.status(201).json({
      message: "User successfuly created you can login using your credentials",
    });
  } catch (e) {
    console.log(e);

    res.status(400).json({
      error: "Server Error",
      message: "An error occured while creating new user",
    });
  }
}

export async function logInUser(req, res) {
  try {
    // Load the passowrd and user name
    const { User, pass } = req.body;
    console.log(User);
    console.log(pass);
    // Check if the username exist
    let exist = await user.findOne({ UserName: User }); // load all the info of user to exist

    if (!exist)
      return res.status(404).json({
        error: "Login Error 0",
        value: null,
        message:
          "User dosent exist or incorrect password please contact sayyedzeeshan696@gmail.com and remind him how useless he is that he still havent created a forget password feature",
      });

    // CHECK IF THE PASSWORD EXISTS̥̥

    // 1. Load the hashed password to hash from exist
    const hash = exist.Password;
    // 2. Compare
    const isMatch = await bcrypt.compare(pass, hash);
    // console.log(isMatch);

    // 3. REject the request if the user info is wrong
    if (!isMatch) {
      return res.status(404).json({
        error: "Login Error",
        value: null,
        message:
          "User dosent exist or incorrect password please contact sayyedzeeshan696@gmail.com and remind him how useless he is that he still havent created a forget password feature",
      });
    }
    // 4. Send the user _id back to the page (later use JWT)

    const token = await JWT_Producer(exist._id);
    return res.status(200).json({ message: "Login Success", value: token, userName: exist.UserName });
  } catch (e) {
    console.log("LoginError: ", e);
    res.status(400).json({
      error: "Server Error",
      message:
        "An error occured while loggig in Please contact sayyedzeeshan696@gmail.com",
    });
  }
}
