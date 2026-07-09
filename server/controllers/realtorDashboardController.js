import Realtor from "../models/realtor.model.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const realtor = await Realtor.findById(userId)
      .populate("recruitedBy", "firstName lastName")
      .exec(); // ❌ no lean here

    if (!realtor) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Convert including virtuals
    const realtorObj = realtor.toObject({ virtuals: true });

    // ✅ Count real downlines
    const recruitCount = await Realtor.countDocuments({ recruitedBy: userId });

    return res.json({
      firstName: realtorObj.firstName,
      lastName: realtorObj.lastName,
      name: `${realtorObj.firstName} ${realtorObj.lastName}`,
      avatar: realtorObj.avatar || null,
      downlines: recruitCount,
      recruitedBy: realtorObj.recruitedBy
        ? `${realtorObj.recruitedBy.firstName} ${realtorObj.recruitedBy.lastName}`
        : "Not Assigned",
      referralCode: realtorObj.referralCode,
      referralLink: realtorObj.referralLink, // ✅ Now definitely exists!
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
