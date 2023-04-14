// Landing.js

import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../../utils/general";
import { languageOptions } from "../../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../../lib/defineTheme";
import useKeyPress from "../../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguageDropdown";

const javascriptDefault = `// some comment`;

const Landing = () => {
    const [code, setCode] = useState(javascriptDefault);
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [theme, setTheme] = useState("cobalt");
    const [language, setLanguage] = useState(languageOptions[0]);

    const enterPress = useKeyPress("Enter");
    const ctrlPress = useKeyPress("Control");

    const onSelectChange = (sl) => {
        console.log("selected Option...", sl);
        setLanguage(sl);
    };

    useEffect(() => {
        if (enterPress && ctrlPress) {
            console.log("enterPress", enterPress);
            console.log("ctrlPress", ctrlPress);
            handleCompile();
        }
    }, [ctrlPress, enterPress]);
    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
                break;
            }
            default: {
                console.warn("case not handled!", action, data);
            }
        }
    };
    const handleCompile = () => {
        setProcessing(true);
        const formData = {
            language_id: language.id,
            // encode source code in base64
            source_code: btoa(code),
            stdin: btoa(customInput),
        };
        const options = {
            method: "POST",
            url: process.env.JUDGE0_API_URL,
            params: { base64_encoded: "true", fields: "*" },
            headers: {
                "content-type": "application/json",
                "Content-Type": "application/json",
                "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
                "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
            },
            data: formData,
        };

        axios
            .request(options)
            .then(function (response) {
                console.log("res.data", response.data);
                const token = response.data.token;
                checkStatus(token);
            })
            .catch((err) => {
                let error = err.response ? err.response.data : err;
                setProcessing(false);
                console.log(error);
            });
    };

    const checkStatus = async (token) => {
        // We will come to the implementation later in the code
    };

    function handleThemeChange(th) {
        const theme = th;
        console.log("theme...", theme);

        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {
            defineTheme(theme.value).then((_) => setTheme(theme));
        }
    }
    useEffect(() => {
        defineTheme("oceanic-next").then((_) =>
            setTheme({ value: "oceanic-next", label: "Oceanic Next" })
        );
    }, []);

    const showSuccessToast = (msg) => {
        toast.success(msg || `Compiled Successfully!`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };
    const showErrorToast = (msg) => {
        toast.error(msg || `Something went wrong! Please try again.`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    function handleThemeChange(th) {
        const theme = th;
        console.log("theme...", theme);

        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {
            defineTheme(theme.value).then((_) => setTheme(theme));
        }
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className="h-4 w-full bg-gradient-to-r from-blue-500 via-red-500 to-purple-500"></div>
            <div className="flex flex-col md:flex-row">
                <div className="px-4 py-2">
                    <LanguagesDropdown onSelectChange={onSelectChange} />
                </div>
                <div className="px-4 py-2">
                    <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
                </div>
            </div>
            <div className="flex md:flex-row flex-col space-x-4 items-start px-4 py-4">
                <div className="flex flex-col w-full h-full justify-start items-end">
                    <CodeEditorWindow
                        code={code}
                        onChange={onChange}
                        language={language?.value}
                        theme={theme.value}
                    />
                </div>

                <div className="container md:right-container flex flex-shrink-0 w-full md:w-[30%] flex-col">
                    <OutputWindow outputDetails={outputDetails} />
                    <div className="flex flex-col items-center md:items-end">
                        <CustomInput
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />
                        <button
                            onClick={handleCompile}
                            disabled={!code}
                            className={classnames(
                                "mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 flex-shrink-0",
                                !code ? "opacity-50" : ""
                            )}
                        >
                            {processing ? "Processing..." : "Compile and Execute"}
                        </button>
                    </div>
                    {outputDetails && <OutputDetails outputDetails={outputDetails} />}
                </div>
            </div>
        </>
    );
};
export default Landing;