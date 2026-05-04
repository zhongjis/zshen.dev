{
  nixConfig = {
    extra-trusted-public-keys = ["niks3.numtide.com-1:DTx8wZduET09hRmMtKdQDxNNthLQETkc/yaX7M4qK0g="];
    extra-substituters = ["https://cache.numtide.com"];
  };

  description = "NextJS 16 dev env";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
    systems.url = "github:nix-systems/default";
    llm-agents.url = "github:numtide/llm-agents.nix";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs = {
    nixpkgs,
    flake-utils,
    llm-agents,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        agent-browser = llm-agents.packages.${pkgs.stdenv.hostPlatform.system}.agent-browser;
        vercel-cli = pkgs.stdenvNoCC.mkDerivation rec {
          pname = "vercel";
          version = "50.32.5";

          src = pkgs.fetchurl {
            url = "https://registry.npmjs.org/vercel/-/vercel-${version}.tgz";
            hash = "sha256-XgqNznJBaGhGE/20MgZQLsIdUuorkHpkKyzUfKCz9j0=";
          };

          nativeBuildInputs = [pkgs.makeWrapper];

          sourceRoot = "package";
          dontBuild = true;
          doCheck = false;

          installPhase = ''
            runHook preInstall

            mkdir -p $out/libexec/vercel $out/bin
            cp -r dist package.json README.md LICENSE $out/libexec/vercel/
            makeWrapper ${pkgs.nodejs_22}/bin/node $out/bin/vercel \
              --add-flags "$out/libexec/vercel/dist/vc.js"
            ln -s $out/bin/vercel $out/bin/vc

            runHook postInstall
          '';
        };

        cleanupScript =
          pkgs.writeShellScript "cleanup-stale-agent-browser"
          (builtins.readFile ./nix/cleanup-stale-agent-browser.sh);

        shellHook =
          builtins.replaceStrings
          ["@opensslDev@" "@prismaEngines@" "@cleanupScript@" "@agentBrowserPath@"]
          ["${pkgs.openssl.dev}" "${pkgs.prisma-engines_7}" "${cleanupScript}" "${agent-browser}"]
          (builtins.readFile ./nix/shell-hook.sh);
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            prisma-engines_7
          ];
          packages = with pkgs; [
            nodejs_22
            pnpm
            openssl

            agent-browser
            supabase-cli
            vercel-cli
          ];
          shell = "/bin/zsh";
          inherit shellHook;
        };
      }
    );
}
