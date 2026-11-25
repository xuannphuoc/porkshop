import type { ComponentType } from "react";
import { Route } from "react-router";
import HomeTemplate from "../pages/HomeTemplate";
import HomePage from "../pages/HomePage";
import ProductListPage from "../features/products/pages/ProductListPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import AdminPage from "../pages/AdminPage";
import NotFoundPage from "../pages/NotFoundPage";
import AuthPage from "../pages/AuthPage";
import MyOrdersPage from "../pages/MyOrdersPage";
import ProtectedRoute from "../auth/ProtectedRoute";

function LoginPage() { return <AuthPage mode="login" />; }
function RegisterPage() { return <AuthPage mode="register" />; }
function ProtectedCheckout() { return <ProtectedRoute><CheckoutPage /></ProtectedRoute>; }
function ProtectedOrderSuccess() { return <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>; }
function ProtectedMyOrders() { return <ProtectedRoute><MyOrdersPage /></ProtectedRoute>; }
function ProtectedAdmin() { return <ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>; }

type RouteConfig = {
  path: string;
  element: ComponentType;
  nested?: RouteConfig[];
};

const routes: RouteConfig[] = [
  {
    path: "/",
    element: HomeTemplate,
    nested: [
      { path: "", element: HomePage },
      { path: "products", element: ProductListPage },
      { path: "products/:productId", element: ProductDetailPage },
      { path: "cart", element: CartPage },
      { path: "checkout", element: ProtectedCheckout },
      { path: "order-success/:orderId", element: ProtectedOrderSuccess },
      { path: "admin", element: ProtectedAdmin },
      { path: "login", element: LoginPage },
      { path: "register", element: RegisterPage },
      { path: "my-orders", element: ProtectedMyOrders },
      { path: "*", element: NotFoundPage },
    ],
  },
];

export function renderRoutes() {
  return routes.map(function (route) {
    const ParentComponent = route.element;

    if (route.nested !== undefined) {
      return (
        <Route key={route.path} path={route.path} element={<ParentComponent />}>
          {route.nested.map(function (childRoute) {
            const ChildComponent = childRoute.element;
            return <Route key={childRoute.path} path={childRoute.path} element={<ChildComponent />} />;
          })}
        </Route>
      );
    } else {
      return <Route key={route.path} path={route.path} element={<ParentComponent />} />;
    }
  });
}
