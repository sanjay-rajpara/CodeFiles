export interface IArticlesModel {
  articles: IArticleModel[];
}
export interface IPostUploadLinksModel {
  mediaList: {
    name: string,
    signedUrl: string,
    contentType: string,
    resourceId: string
  }[];
  inputTextFile: {
    name: string,
    signedUrl: string,
    uploadPath: string
  };
}

export interface IUploadLinksModel {
  mediaList: IMediaListModel[];
  inputTextFile: IInputTextList[];
}
export interface IMediaListModel {
  name: string;
  signUrl: string;
  contentType: string;
  resourceId: string;
}
export interface IInputTextList {
  name: string;
  signUrl: string;
  contentType: string;
  resourceId: string;
}
export interface IArticleModel {
  id: string;
  thumbnail: string;
  name: string;
  reporter: {
    name: string;
    thumbnail: string;
  };
  outputZip: string;
  approved: boolean;
  createdAt: string;
  deliverables: IArticleDelivarebleModel[];
}
export interface IArticleDelivarebleModel {
  id: string;
  language: string;
  ratio: string;
  duration: string;
  status: string;
  outputPath: string;
}
export interface IDeliverableModel {
  deliverableId: string;
  id: string;
  parentId: string;
  user: {
    id: string;
    name: string;
  };
  content: string;
  timestamp: string;
  commentedAt: string;
  lastEditAt: string;
  coordinates: {
    x: 0;
    y: 0;
  };
}
export interface ICommentModel {
  id: string;
  parentId: string;
  user: {
    id: string;
    name: string;
  };
  content: string;
  commentedAt: string;
  lastEditAt: string;
}
export interface IArticleCommentModel {
  articleComments: ICommentModel[];
  // deliverablesCommnts: IDeliverableModel[];
}
export interface IDeliverableComments {
  deliverableComments: IDeliverableModel[];
}


export interface IMediaFilesModel {
  resourceId: string;
  name: string;
  credits: string;
  notes: string;
}

export interface ICreateArticleModel {
  article: {
    name: string;
    inputUrl: string;
    contentType: React_Select;
    inputTextContent: string;
    inputResourceId: string;
    estimatedPublish: string;
    mediaFiles: IMediaFilesModel[];
  }
  deliverables: ICreateDeliverableModel[]
}
export interface ICreateDeliverableModel {
  reporterId: string
  voiceoverOnly: string
  anonymousReporter: string
  aspectRatio: React_Select
  duration: React_Select
  language: React_Select
}

export interface ICreateCommentModel {
  parentId: string;
  content: string;
  commentedAt: string;
}
export interface React_Select {
  label: string,
  value: string
}