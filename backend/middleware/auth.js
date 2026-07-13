router.get("/", authMiddleware, (req, res) => {
    res.json({
        message: "Protected route",
        user: req.user
    });
});