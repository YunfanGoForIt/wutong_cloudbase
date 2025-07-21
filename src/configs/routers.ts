import INDEX from '../pages/index.jsx';
import ROOM from '../pages/room.jsx';
import EDIT_DIARY from '../pages/edit-diary.jsx';
import UPLOAD_PHOTO from '../pages/upload-photo.jsx';
export const routers = [{
  id: "index",
  component: INDEX
}, {
  id: "room",
  component: ROOM
}, {
  id: "edit-diary",
  component: EDIT_DIARY
}, {
  id: "upload-photo",
  component: UPLOAD_PHOTO
}]