import LoginProviders from "@/components/LoginProviders";
import Logo from "@/components/Logo";

const Login = async () => (
  <div className="flex h-screen flex-1 flex-col py-24 sm:px-6 lg:px-8 bg-terciary-500">
    <div className="flex flex-col max-w-[480px] mx-auto">
      <Logo size="large" />
      <hr className="mt-6 border-t border-primary-600" />
      <h2 className="mt-6 text-center text-lg font-bold tracking-tight text-gray-200">Inicia sesión en tu cuenta</h2>
      <div className="mt-6 gap-4">
        <LoginProviders />
      </div>
    </div>
  </div>
);
export default Login;
