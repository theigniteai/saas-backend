import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

export const signupUser = async (req, res) => {
  const { email, password } = req.body
  const userExists = await User.findOne({ email })
  if (userExists) return res.status(400).json({ message: 'User already exists' })

  const user = await User.create({ email, password })
  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400).json({ message: 'Invalid user data' })
  }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(401).json({ message: 'Invalid email or password' })
  }
}
