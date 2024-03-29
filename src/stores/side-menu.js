import { Children } from "react";
import { atom } from "recoil";

const sideMenu = atom({
    key: "sideMenu",
    default: {
        menu: [
            {
                pathname: "/",
                title: "面接提案確認",
            },
            {
                pathname: "/resume-regist",
                title: "履歴書管理",
                /*subMenu: [
                    {
                        pathname: "/resume-regist",
                        title: "이력서 등록",
                    },
                    {
                        pathname: "/resume-change",
                        title: "이력서 변경",
                    },
                ],*/
            },
            {
                pathname: "/page-2",
                title: "ポイント管理",
                subMenu: [
                    {
                        pathname: "/point-detail",
                        title: "ポイント確認/交換",
                    },
                    // {
                    //     pathname: "/giftcard-regist",
                    //     title: "Amazonギフトカード登録",
                    // },
                    {
                        pathname: "/giftcard-record",
                        title: "Amazonギフトカード交換履歴",
                    },
                ],
            },
            {
                pathname: "/nickname",
                title: "ニックネーム変更",
            },
            {
                pathname: "/message-reception",
                title: "メッセージボックス",
                subMenu: [
                    {
                        pathname: "/message-reception",
                        title: "受信メッセージ箱",
                    },
                    {
                        pathname: "/message-sent",
                        title: "送信メッセージ箱",
                    },
                    {
                        pathname: "/message-box",
                        title: "保管箱",
                    },
                ],
            },
            {
              pathname: "/suspension",
              title: "利用停止/脱退",
              subMenu: [
                  {
                      pathname: "/suspension",
                      title: "利用停止",
                  },
                  {
                      pathname: "/withdraw",
                      title: "会員退会",
                  },
              ],
          },
            // {
            //     pathname: "",
            //     title: "ログアウト",
            // },
        ],
    },
});

export { sideMenu };
