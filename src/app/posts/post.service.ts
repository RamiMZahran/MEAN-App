import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: Post[]; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .subscribe(data => {
        this.posts = data.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: data.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe(res => {
        this.router.navigate(['/']);
      });
  }
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('_id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        _id: id,
        title,
        content,
        imagePath: image
      };
    }
    //    const post: Post = { _id: id, title, content, imagePath: null };
    this.http
      .put<{ message: string }>(
        'http://localhost:3000/api/posts/' + id,
        postData
      )
      .subscribe(res => {
        this.router.navigate(['/']);
      });
  }

  getPost(id: string) {
    return this.http.get<{ message: string; post: Post; imagePath: string }>(
      'http://localhost:3000/api/posts/' + id
    );
  }
  deletePost(id: string) {
    return this.http.delete<{ message: string }>(
      'http://localhost:3000/api/posts/' + id
    );
  }
}
