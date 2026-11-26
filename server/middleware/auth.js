const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Short-lived in-memory cache for authenticated users to avoid redundant DB roundtrips
// on rapid/parallel requests while keeping account deactivation checks fresh.
const USER_CACHE_TTL_MS = 10_000;
const userCache = new Map();

// Protect routes — require valid JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cacheKey = String(decoded.id);
    const cached = userCache.get(cacheKey);

    let user;
    if (cached && cached.expiresAt > Date.now()) {
      user = cached.user;
    } else {
      user = await User.findById(decoded.id)
        .select('_id role active name email classId language')
        .lean();

      if (user) {
        userCache.set(cacheKey, {
          user,
          expiresAt: Date.now() + USER_CACHE_TTL_MS,
        });
        // Prevent unbounded memory growth
        if (userCache.size > 1000) {
          const firstKey = userCache.keys().next().value;
          userCache.delete(firstKey);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

function invalidateUserCache(userId) {
  if (userId) {
    userCache.delete(String(userId));
  }
}

protect.invalidateUserCache = invalidateUserCache;
module.exports = protect;
