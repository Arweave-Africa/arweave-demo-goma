import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { WebBundlr } from "@bundlr-network/client";
import { providers } from "ethers";
//@ts-ignore
import fileReaderStream from "filereader-stream";
import { useRouter } from "next/router";

const Upload = () => {
  const [fileToUplload, setFileToUpload] = useState<File | null>();
  const [filePreviewLink, setFilePreviewLink] = useState("");
  const router = useRouter();

  const previewFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files?.length == 0) {
      setFilePreviewLink("");
      setFileToUpload(null);
      return;
    }
    setFilePreviewLink(URL.createObjectURL(files![0]));
    setFileToUpload(files![0]);
  };

  const uploadFile = async (e: FormEvent) => {
    e.preventDefault();
    //@ts-ignore
    const [userAddress] = await window.ethereum.enable();
    //@ts-ignore
    const provider = new providers.Web3Provider(window.ethereum);
    const bundlr = new WebBundlr(
      "https://devnet.bundlr.network",
      "matic",
      provider,
    );
    await bundlr.ready();
    const tokenAmount = (await bundlr.getBalance(userAddress)).toNumber();
    const price = await (
      await bundlr.getPrice(fileToUplload?.size!)
    ).toNumber();
    if (tokenAmount < price) {
      const tokensToFund = price - tokenAmount;
      await bundlr.fund(bundlr.utils.toAtomic(tokensToFund));
    }
    const fileStream = fileReaderStream(fileToUplload);
    const tags = [
      {
        name: "App-Name",
        value: "arweave-demo",
      },
    ];
    await bundlr.upload(fileStream, { tags });
    router.push("/");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="w-11/12 sm:w-9/12 lg:w-6/12 py-4 flex flex-col items-center rounded-lg">
        <h2 className="text-lg font-semibold sm:text-xl">
          Let your images time travel today
        </h2>
        <form
          onSubmit={uploadFile}
          className="w-11/12 sm:w-7/12 my-10 sm:my-8 text-center"
        >
          <div className="w-full h-44 lg:h-56 bg-slate-300 rounded-2xl">
            <div className="h-[40%] w-full flex items-center justify-center my-6">
              <Image
                height={50}
                width={50}
                src="/assets/imagePlaceholder.png"
                alt="photo placeholder"
              />
            </div>
            <label
              htmlFor="fileUpload"
              className="text-sm px-1 py-1 xl:text-lg xl:mx-4 xl:px-4 xl:py-2 rounded-xl bg-slate-200 border-2 border-gray-600 cursor-pointer hover:bg-slate-100"
            >
              Click here to upload your data
            </label>
            <input
              type="file"
              onChange={previewFiles}
              name=""
              id="fileUpload"
              hidden
              accept="image/*"
            />
          </div>

          <div className="w-full my-8 flex justify-center">
            {filePreviewLink && (
              <Image
                src={filePreviewLink}
                height={80}
                width={80}
                alt="file preview"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={!fileToUplload}
            className={`w-[250px] h-8 mt-8 bg-blue-600 font-bold text-white rounded-lg hover:bg-blue-500 cursor-pointer`}
          >
            Upload now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
