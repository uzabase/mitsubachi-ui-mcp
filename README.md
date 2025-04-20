# mitsubachi-ui-mcp
## これはなに
[mitsubachi-ui](https://github.com/uzabase/mitsubachi-ui)の非公式なModel Context Protocol (MCP) serverです。
非公式なのでmitcubachi-uiの仕様変更があれば使えなくなるかもしれません。

## 使い方
MCPサーバーを利用したいアプリケーションで以下のコマンドを実行するとサーバーをインストールし、起動できます。

```
npx --yes "github:alpdr/mitsubachi-ui-mcp#semver:<version>"
```

## 対応するmitsubachi-uiの版
mitsubachi-uiのバージョニングポリシーはセマンティックバージョニングです。
mitsubachi-ui-mcpが対応するmitsubachi-uiのバージョンを示すために、
両者のメジャーバージョンとマイナーバージョンを揃えています。
たとえば、mitsubachi-uiの`0.11.0`と併用するときは`0.11.`から始まるバージョンのmitsubachi-ui-mcpを利用してください。