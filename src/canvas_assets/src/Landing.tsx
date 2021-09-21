import { Divider } from "@react-spectrum/divider";
import { Flex } from "@react-spectrum/layout";
import { Heading, Text } from "@react-spectrum/text";
import React from "react";
import { Link } from "react-router-dom";
import NftPreview from "./NftPreview";

interface Props {}

function Landing(props: Props) {
  const {} = props;

  return (
    <main>
      <h1>Canvas #1 - Dialectic</h1>
      <Text>
        <p>
          First of all, I want to thank everyone who participated in the IC
          Canvas experiment. Whether you added a single pixel, created a
          beautiful design, or deliberately attempted to sabotage the
          experiment, your engagement became part of the history and the meaning
          of this piece.
        </p>
        <p>
          After reflecting on the experiment, I have decided that the final
          state of the canvas is incomplete on its own. Instead, I have chosen
          to mint a set of three NFT's as Canvas #1 - Dialectic. The concept I'm
          exploring with this set comes from the German philosopher, G.W.F.
          Hegel's famous work, <i>Phenomenology of Spirit</i>, which you can
          read more about{" "}
          <a href="https://plato.stanford.edu/entries/hegel-dialectics/">
            here
          </a>
          . Without further ado, I present to you <strong>Thesis</strong>,{" "}
          <strong>Antithesis</strong>, and <strong>Synthesis</strong>.
        </p>
      </Text>
      <Flex wrap gap="1rem" width="100%" justifyContent="space-evenly">
        <NftPreview imgSrc="/thesis.png" defaultMode="light" title="Thesis">
          <p>
            Thesis represents my unchallenged intent for the canvas. It's a
            playful image, following three days of contributions from users.
            When I created the project, I imagined something like this image
            would be the final state of the canvas, where most people can see
            their contributions in the final image.
          </p>
        </NftPreview>
        <NftPreview
          imgSrc="/antithesis.png"
          defaultMode="dark"
          title="Antithesis"
        >
          <>
            <p>
              Antithesis caught me off guard. After I'd noticed some larger
              images overwriting unnecessary detail by painting in background
              details, I made a personal plea to botters to leave minimal
              updates only. Through the use of bot users, some user or users
              replaced approximately 1/5 of the canvas with large screenshots,
              including my post to the IC Canvas portal.{" "}
            </p>
            <p>
              These users rejected my intent, and threw it back at me. This art
              was drawn in the medium of a smart contract, and the rules I
              established at the start of the experiment could do nothing to
              stop someone from claiming as much of the canvas as they wanted,
              by bypassing the UI and talking directly with the Canister running
              the project.
            </p>
          </>
        </NftPreview>
        <NftPreview
          imgSrc="/synthesis.png"
          defaultMode="light"
          title="Synthesis"
        >
          <>
            <p>
              And then we have the final state of the canvas. Since the bots
              could already make as many updates as they wanted, I reduced the
              cooldown for "real" users to 1 second, and it led to more
              hand-drawn art to arise. Surprisingly, you can see that two of the
              large screenshots appear to have partially reverted. The story
              becomes clearer if you toggle the transparency.
            </p>
            <p>
              In reality, another user wrote a new bot that fought back against
              the antithesis, attempting to restore the canvas from a screenshot
              I had shared the previous day. Both bots were working continuously
              until the very end, fighting to establish their own preferred
              version of the canvas, leading to an in-between state of noise,
              revealing traces of what was there before.
            </p>
          </>
        </NftPreview>
      </Flex>
      <Divider />
      <h2>NFT Sales and information</h2>
      <p>
        These three pieces will be auctioned off on the{" "}
        <a href="https://entrepot.app">Entrepot Marketplace</a>. 50% of the
        proceeds will be donated to the{" "}
        <a href="https://www.catf.us/">Clean Air Task Force</a>, while the rest
        will go to the Canvas team. The auction date is still to be announced.
        We are excited to announce that these canvases will be the first NFT's
        ever sold at auction on the Internet Computer!
      </p>
      <p>
        We will also be working with the Entrepot team to distribute our Pixel
        NFT's. Once we get the claiming mechanism in place, you will be able to
        return to this site at any point and claim your NFT, which you can then
        view and trade in the Entrepot marketplace. Your pixel will be a random
        non-transparent pixel from the canvas.
      </p>
      <h2>Archive</h2>
      To view an archived version of the final canvas state, visit the{" "}
      <Link to="/archive">Archive</Link>
    </main>
  );
}

export default Landing;
