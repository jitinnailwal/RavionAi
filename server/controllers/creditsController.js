// controllers/creditsController.js
import User from "../models/user.js";

export const purchaseCredits = async (req, res) => {
  try {
    const userId = req.user._id;
    const amount = Number(req.body.amount || 0);

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credit amount" });
    }

    // Atomically increment credits
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { credits: amount } },
      { new: true }
    ).select("credits");

    return res.json({
      success: true,
      message: "Credits added",
      credits: updatedUser.credits,
    });
  } catch (err) {
    console.error("purchaseCredits error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
