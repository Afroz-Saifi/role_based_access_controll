const authorization = (roles) => {
  return async (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.json({ msg: "you are not authorized for this route" });
    }
  };
};

module.exports = { authorization };
