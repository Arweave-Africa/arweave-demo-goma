import Image from "next/image";
import { useEffect, useState } from "react";
import Arweave from "arweave";

export default function Home() {
  const [address, setAddress] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      //@ts-ignore
      const [userAddress] = await window.ethereum.enable();
      const arweave = Arweave.init({});
      const queryObject = {
        query: `{
          transactions(
            first:100,
            tags: [
              {
                name: "App-Name",
                values: ["arweave-demo"]
              }
            ]
          ) 
          {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
              }
            }
          }
        }`,
      };

      const { data } = await arweave.api.post("/graphql", queryObject);
      setImages(data.data.transactions.edges);
      console.log(data.data.transactions.edges);
      setAddress(userAddress);
    };
    fetchData();
  }, []);

  return (
    <main>
      <h1 className="text-center w-full text-lg sm:text-xl lg:text-2xl font-bold mt-4">
        Arweave Africa memories
      </h1>
      <div className="flex w-full justify-evenly flex-wrap">
        {images.length > 0 &&
          images?.map((image, index) => (
            <Image
              key={index}
              height={50}
              width={50}
              //@ts-ignore
              src={`https://arweave.net/${image.node.id}`}
              className="rounded-lg"
              alt="image"
            />
          ))}
        {images.length == 0 && (
          <p className="mt-[45vh] text-gray-500">No images found</p>
        )}
      </div>
    </main>
  );
}
