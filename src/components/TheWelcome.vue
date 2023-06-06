<template>
  <div class="row">

    <div class="col-md-12 mb-5">
      Projects
      <div class="container" style="background-color: blue;">


        <div class="d-flex justify-content-betwen">
          <div class="row">
            <div class="col-md-4">
              <el-button type="success" size="default" class="mt-3 mb-3" v-show="newcreationbutton"
                @click.prevent="showCreateMode">Create New Project</el-button>
            </div>
            <div class="col-md-8" v-show="newcreationcontent">

              <el-input style="width: 60%" v-model="form.name" placeholder="Project name" />

              <el-button style="width: 30%;background-color: green;color:white" type="success" size="default"
                class="mt-3 mb-3 ml-2" v-show="!editmode" :loading="loading" @click.prevent="submitProject">{{ loading ?
                  'Processing' : 'Add' }}</el-button>

              <el-button style="width: 30%" type="success" size="default" class="mt-3 mb-3 ml-2" v-show="editmode"
                :loading="loading2" @click.prevent="editProject">{{ loading2 ? 'Processing' : 'Edit' }}</el-button>

            </div>
          </div>
        </div>

        <table class="table table-hover" style="background-color: red;color:white">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Project Name</th>
              <th scope="col">Date Created</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(project, index) in projects" :key="index">
              <th scope="row">{{ index + 1 }}</th>
              <td>{{ project.name }}</td>
              <td>{{ moment(project.created_at).format("ddd MMM DD, YYYY") }}</td>
              <td>
                <el-button type="success" size="small" @click.prevent="showEditMode(project)">Edit</el-button>
                <el-button type="danger" size="small" @click.prevent="deleteProject(project)">Delete</el-button>
              </td>
            </tr>
          </tbody>
        </table>

        <Page :total="pageInfo.total" :current="pageInfo.current_page" :page-size="parseInt(pageInfo.per_page)"
          v-if="pageInfo" @on-change="getAllProjects" class="mt-2 d-flex justify-content-end" />

      </div>



    </div>


    <div class="col-md-12 mb-5">
      Tasks
      <div class="container" style="background-color: blue;">


        <div class="d-flex justify-content-betwen">
          <div class="row">
            <div class="col-md-4">
              <el-button type="success" size="default" class="mt-3 mb-3" v-show="newcreationtaskbutton"
                @click.prevent="showCreateTaskMode">Create New Task</el-button>
            </div>
            <div class="col-md-8" v-show="newcreationtaskcontent">

              <el-input style="width: 30%" v-model="formtask.name" placeholder="Task name" />

              <el-select v-model="formtask.project_id" filterable placeholder="Select project" class="ml-2"
                style="width: 30%">
                <el-option v-for="project in projectsarray" :key="project.id" :label="project.name" :value="project.id" />
              </el-select>

              <el-button style="width: 30%" type="success" size="default" class="mt-3 mb-3 ml-2" v-show="!editmodetask"
                :loading="loading" @click.prevent="submitTask">{{ loading ? 'Processing' : 'Add' }}</el-button>

              <el-button style="width: 30%" type="success" size="default" class="mt-3 mb-3 ml-2" v-show="editmodetask"
                :loading="loading2" @click.prevent="editTask">{{ loading2 ? 'Processing' : 'Edit' }}</el-button>

            </div>
          </div>


        </div>

        <div class="d-flex justify-content-betwen mb-2">
          <div class="row">
            <div class="col-md-6">
              <el-select v-model="search.project" filterable placeholder="Search project" class="ml-2 w-100"
                style="width: 30%" @change="filterTasksWithProject" clearable>
                <el-option v-for="project in projectsarray" :key="project.id" :label="project.name" :value="project.id" />
              </el-select>
            </div>
            <div class="col-md-6">
              <el-button type="success" size="default" @click.prevent="clearFilters">Clear Filters</el-button>
            </div>
          </div>

        </div>

        <table class="table table-hover">

          <!-- I have comment this out because the draggable library is breaking the default table structure -->

          <!-- <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Project Name</th>
              <th scope="col">Task Name</th>
              <th scope="col">Priority</th>
              <th scope="col">Date Created</th>
              <th scope="col">Actions</th>
            </tr>
          </thead> -->


          <draggable v-model="tasks" :itemKey="item => item.id" @update="reorderTasks">
            <template #item="{ element }">
              <tbody style="background-color: red;color:white">
                <tr>
                  <!-- <th scope="row">{{ element.id }}</th> -->
                  <td>{{ element.project.name }}</td>
                  <td>{{ element.name }}</td>
                  <td>{{ element.priority }}</td>
                  <td>{{ moment(element.created_at).format("ddd MMM DD, YYYY") }}</td>
                  <td>
                    <el-button type="success" size="small" @click.prevent="showEditTaskMode(element)">Edit</el-button>
                    <el-button type="danger" size="small" @click.prevent="deleteTask(element)">Delete</el-button>
                  </td>
                </tr>
              </tbody>
            </template>
          </draggable>


        </table>

        <Page :total="pageTasksInfo.total" :current="pageTasksInfo.current_page"
          :page-size="parseInt(pageTasksInfo.per_page)" v-if="pageTasksInfo && mainfetch" @on-change="getAllTasks"
          class="mt-2 d-flex justify-content-end" />


        <Page :total="pageTasksInfo.total" :current="pageTasksInfo.current_page"
          :page-size="parseInt(pageTasksInfo.per_page)" v-if="pageTasksInfo && filterfetch"
          @on-change="paginationTaskSearch" class="mt-2 d-flex justify-content-end" />

      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import axios from "axios"
import moment from "moment"
import draggable from 'vuedraggable'
import { debounce } from "lodash"

let BaseApi = ref('http://127.0.0.1:8000/api')


// Project variables start

let loading = ref(false)
let loading2 = ref(false)
let newcreationbutton = ref(true)
let newcreationcontent = ref(false)
let editmode = ref(false)

let projects = ref([])

let projectsarray = ref([])

let total = ref(1)

let pageInfo = ref(null)

let pageTasksInfo = ref(null)

let form = ref({
  id: '',
  name: ''
})

// Project variables end


// Task variables start

let loading3 = ref(false)
let loading4 = ref(false)
let newcreationtaskbutton = ref(true)
let newcreationtaskcontent = ref(false)
let editmodetask = ref(false)

let tasks = ref([])

let newTask = null;
let oldTask = null;

let formtask = ref({
  id: '',
  name: '',
  project_id: ''
})

// Task variables end


// Filter variable start

let mainfetch = ref(false)
let filterfetch = ref(false)

let search = ref({
  project: ""
})

// Filter variable end

//Project functions start

let showCreateMode = () => {
  editmode.value = false
  newcreationcontent.value = true
}

let showEditMode = (project) => {
  editmode.value = true
  newcreationcontent.value = true
  form.value.name = project.name
  form.value.id = project.id
}

let submitProject = async () => {
  loading.value = true
  let response = await axios.post(BaseApi.value + '/create-project', form.value)
  form.value.name = ''
  getAllProjects()
  getAllProjectsWithoutPagination()
  loading.value = false
}

let editProject = async () => {
  loading.value = true
  let response = await axios.post(BaseApi.value + `/update-project/${form.value.id}`, form.value)
  form.value.name = ''
  form.value.id = ''
  newcreationcontent.value = false
  getAllProjects()
  getAllProjectsWithoutPagination()
  loading.value = false
}

let deleteProject = async (project) => {
  let response = await axios.delete(BaseApi.value + `/delete-project/${project.id}`)
  getAllProjects()
  getAllProjectsWithoutPagination()
}

let getAllProjects = async (page = 1) => {
  let response = await axios.get(BaseApi.value + `/get-all-projects?page=${page}&total=${total.value}`)
  projects.value = response.data.projects.data
  pageInfo.value = response.data.projects
}

let getAllProjectsWithoutPagination = async () => {
  let response = await axios.get(BaseApi.value + '/get-all-projects-without-pagination')
  projectsarray.value = response.data.projects
}

//Project functions end

//Task functions start

let showCreateTaskMode = () => {
  editmode.value = false
  newcreationtaskcontent.value = true
}

let showEditTaskMode = (project) => {
  editmodetask.value = true
  newcreationtaskcontent.value = true
  formtask.value.name = project.name
  formtask.value.id = project.id
  formtask.value.project_id = project.project.id
}

let submitTask = async () => {
  loading3.value = true
  let response = await axios.post(BaseApi.value + '/create-task', formtask.value)
  formtask.value.name = ''
  formtask.value.project_id = ''
  getAllTasks()
  loading3.value = false
}

let editTask = async () => {
  loading4.value = true
  let response = await axios.post(BaseApi.value + `/update-task/${formtask.value.id}`, formtask.value)
  formtask.value.id = ''
  formtask.value.name = ''
  formtask.value.project_id = ''
  newcreationcontent.value = false
  getAllTasks()
  loading4.value = false
}

let deleteTask = async (Task) => {
  let response = await axios.delete(BaseApi.value + `/delete-task/${Task.id}`)
  getAllTasks()
}

let reorderTasks = (event) => {
  newTask = tasks.value[event.oldIndex];
  oldTask = tasks.value[event.newIndex];
  updateTasksOrder(newTask, oldTask)
}

let updateTasksOrder = async (newTask, oldTask) => {
  let params = { newTask, oldTask }
  let response = await axios.post(BaseApi.value + '/update-task-order', params)
  getAllTasks()
}

let clearFilters = () => {
  search.value = {}
  mainfetch.value = true
  filterfetch.value = false
  getAllTasks()
}

let filterTasksWithProject = debounce(async () => {
  await filterTasks(search.value.project);
}, 300);

let paginationTaskSearch = debounce(async (page) => {
  await filterTasks(search.value.project, page);
}, 300)

let filterTasks = (query, page = 1) => {
  axios.get(BaseApi.value + `/filter-tasks?page=${page}&total=${total.value}`, { params: { query } }).then((response) => {
    tasks.value = response.data.tasks.data
    pageTasksInfo.value = response.data.tasks
    mainfetch.value = false
    filterfetch.value = true
  });
}

let getAllTasks = async (page = 1) => {
  let response = await axios.get(BaseApi.value + `/get-all-tasks?page=${page}&total=${total.value}`)
  tasks.value = response.data.tasks.data
  pageTasksInfo.value = response.data.tasks
  mainfetch.value = true
  filterfetch.value = false
}

//Task functions end

onMounted(() => {
  getAllProjects()
  getAllProjectsWithoutPagination()
  getAllTasks()
})
</script>
