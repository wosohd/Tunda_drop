import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          // Applies to every screen container
          contentStyle: {
            padding: 16,
            backgroundColor: "#fff",
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "TundaDrop" }} />

        <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
        <Stack.Screen name="(auth)/register" options={{ title: "Create account" }} />

        <Stack.Screen name="(shop)/categories" options={{ title: "Categories" }} />
        <Stack.Screen name="(shop)/category/[id]" options={{ title: "Category" }} />
        <Stack.Screen name="(shop)/product/[id]" options={{ title: "Product" }} />
        <Stack.Screen name="(shop)/cart" options={{ title: "Cart" }} />
        <Stack.Screen name="(shop)/checkout" options={{ title: "Checkout" }} />

        <Stack.Screen name="(orders)/orders" options={{ title: "My Orders" }} />
        <Stack.Screen name="(orders)/order/[id]" options={{ title: "Order" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
