import { usePreferences } from "../../context/AppPreferences";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validations/authSchema";
import {Link, useNavigate} from "react-router-dom";
import { loginUser } from "../../services/authService";
import { saveToken } from "../../utils/auth";
function LoginForm(){
    const { t } = usePreferences();
    const navigate = useNavigate();
    const {
        register, handleSubmit, formState:{errors},
    } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);

      saveToken(response.token);

      alert(response.message);

      navigate("/chat");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };
    return (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-indigo-600">
                ChatSphere
            </h1>
            <p className="text-center text-gray-500 mt-2">
                {t("welcomeBack")}
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        {t("email")} : 
                    </label>
                    <input 
                    type="email" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder={t("enterEmail")}
                    {...register("email")}
                    />
                    <p className="text-red-500 text-sm mb-4">
                        {errors.email?.message}
                    </p>
                </div>
                <div className="mb-6">
                    <label  className="block mg-2 font-medium">
                        {t("password")} 
                    </label>
                    <input 
                    type="password" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder={t("enterPassword")}
                    {...register("password")}
                    />
                    <p className="text-red-500 text-sm mb-4">
                        {errors.password?.message}
                    </p>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                    Login
                </button>
            </form>
            <p className="text-center mt-6">
                {t("noAccount")} 
                <Link to = "/register" className="text-indigo-600 ml-2 font-semibold">
                Register
                </Link>
            </p>
        </div>
    );
}
export default LoginForm;