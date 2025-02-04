import Head from "next/head";
import Login from "../components/Login";
import SimpleHeader from "../components/SimpleHeader";
import Footer from "../components/Footer";

const LoginPage = () => {
    return (
        <div>
            <Head>
                <title>Login Page</title>
                <meta name="description" content="Login page." />
            </Head>
            <SimpleHeader />
            <main className="bg-lightest">
                <Login />
                <Footer />
            </main>
        </div>
    );
};

export default LoginPage;