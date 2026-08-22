export function getDashboardPathByRole(role) {
  switch (role) {
    case "FARMER":
      return "/farmer/dashboard";
    case "COMPANY":
      return "/company/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}
