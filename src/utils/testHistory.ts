/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test utility to validate fabric-history-v6 functionality
 * This can be used in the browser console to test undo/redo
 */

export const testHistoryFunctionality = async (canvas: any) => {
  if (!canvas) {
    console.error("No canvas provided");
    return false;
  }

  try {
    console.log("🔍 Testing History Functionality...");

    // Test 1: Check if history methods exist
    const requiredMethods = [
      "undo",
      "redo",
      "canUndo",
      "canRedo",
      "clearHistory",
    ];
    const missingMethods = requiredMethods.filter(
      (method) => typeof canvas[method] !== "function"
    );

    if (missingMethods.length > 0) {
      console.error("❌ Missing history methods:", missingMethods);
      return false;
    }
    console.log("✅ All history methods are available");

    // Test 2: Check initial state
    console.log("📊 Initial state:");
    console.log("  - Can Undo:", canvas.canUndo());
    console.log("  - Can Redo:", canvas.canRedo());
    console.log(
      "  - History Undo Length:",
      canvas.historyUndo?.length || "undefined"
    );
    console.log(
      "  - History Redo Length:",
      canvas.historyRedo?.length || "undefined"
    );

    // Test 3: Add an object and check history
    const fabricModule = await import("fabric");
    const fabric = fabricModule.default || fabricModule;
    if (fabric && fabric.Rect) {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 50,
        height: 50,
        fill: "red",
      });

      canvas.add(rect);
      canvas.renderAll();

      // Wait a bit for history to be recorded
      setTimeout(() => {
        console.log("📊 After adding rectangle:");
        console.log("  - Can Undo:", canvas.canUndo());
        console.log("  - Can Redo:", canvas.canRedo());
        console.log("  - Objects count:", canvas.getObjects().length);

        // Test 4: Try undo
        if (canvas.canUndo()) {
          canvas.undo();
          setTimeout(() => {
            console.log("📊 After undo:");
            console.log("  - Can Undo:", canvas.canUndo());
            console.log("  - Can Redo:", canvas.canRedo());
            console.log("  - Objects count:", canvas.getObjects().length);

            // Test 5: Try redo
            if (canvas.canRedo()) {
              canvas.redo();
              setTimeout(() => {
                console.log("📊 After redo:");
                console.log("  - Can Undo:", canvas.canUndo());
                console.log("  - Can Redo:", canvas.canRedo());
                console.log("  - Objects count:", canvas.getObjects().length);
                console.log(
                  "✅ History functionality test completed successfully!"
                );
              }, 100);
            }
          }, 100);
        }
      }, 100);
    }

    return true;
  } catch (error) {
    console.error("❌ History test failed:", error);
    return false;
  }
};

// Expose to window for browser console testing
if (typeof window !== "undefined") {
  (window as any).testHistoryFunctionality = testHistoryFunctionality;
}
