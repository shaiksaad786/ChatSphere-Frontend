import { usePreferences } from "../../context/AppPreferences";
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validations/authSchema";
import { Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
function RegisterForm(){
    const { t } = usePreferences();
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors},} = useForm({
        resolver: zodResolver(registerSchema),
    });
    const onSubmit = async (data) => {
  try {

    const response = await registerUser({
      name: data.fullName,
      email: data.email,
      password: data.password,
      gender: data.gender,
    });

    alert(response.message);

    navigate("/login");

  } catch (error) {
    alert(error.response?.data?.message || "Registration Failed");
  }
};
    return (
        <div className="w-full max-w-md bg-white-100 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-indigo-600">
                ChatSphere
            </h1>
            <p className="text-center text-gray-500 mt-2">
                {t("createAccount")}
            </p>
            <form onSubmit = {handleSubmit(onSubmit)} className="mt-8">
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        {t("fullName")} : 
                    </label>
                    <input 
                    type="text" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register("fullName")}
                    placeholder={t("enterName")} 
                    />
                    <p className="text-red-500 text-sm mb-3">
                        {errors.fullName?.message}
                    </p>
                </div>
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
                    <p className="text-red-500 text-sm mb-3">
                        {errors.email?.message}
                    </p>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        {t("password")} : 
                    </label>
                    <input 
                    type="password" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder={t("createPassword")}
                     {...register("password")}
                    />
                     <p className="text-red-500 text-sm mb-3">
                        {errors.password?.message}
                    </p>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-medium">
                        Confirm {t("password")} : 
                    </label>
                    <input 
                    type="password" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder={t("confirmPasswordPlaceholder")}
                    {...register("confirmPassword")}
                    />
                    <p className="text-red-500 text-sm mb-5">
                        {errors.confirmPassword?.message}
                    </p>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        Gender
                    </label>

                    <select
                    {...register("gender")}
                    className="w-full border p-3 rounded-lg"
                    >
                    <option value="">{t("selectGender")}</option>
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                    </select>

                    <p className="text-red-500 text-sm">
                    {errors.gender?.message}
                    </p>
                    </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                    Register
                </button>
            </form>
            <p className="text-center mt-6">
                {t("haveAccount")}
                <Link to="/login" className = "text-indigo-600 ml-2 font-semibold">
                Login
                </Link>
            </p>
        </div>
    );
}
export default RegisterForm;