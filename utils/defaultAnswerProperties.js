module.exports = type => {
  switch (type) {
    case "Currency":
      return { required: false, decimals: 0 };
    case "Number":
      return { required: false, decimals: 0 };
    default:
      return { required: false };
  }
};
