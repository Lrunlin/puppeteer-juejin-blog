export default {
  /** 对那些标签进行爬取（见modules/tagList，输入key即可）*/
  tags: ["前端", "JavaScript", "Vue.js", "React.js", "Redis", "LeetCode"],
  /** 发布文章的token 管理系统登录后再localStorage中获取token字段*/
  token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYXV0aCI6MSwiaWF0IjoxNjYzNjQ5OTM5LCJleHAiOjE2OTUxODU5Mzl9.LyXIP6XGTYk6DjuvooJ3FDySQ5luGO-6dib3gGvG66g`,
  mysql: {
    port: 3306,
    host: "localhost",
    user: "root",
    database: "blog",
    password: "",
  },
  /** 部署的服务端端口*/
  apiHost: "http://localhost:3000",
  /** 是否移除文中出现关键词“掘金”，true会删除包含掘金的DOM*/
  removeJueJinKeyWord:true
};
