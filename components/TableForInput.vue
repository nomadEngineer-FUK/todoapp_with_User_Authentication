<script setup>
    const newTodo = useNewTodo(); // 新規Todo登録時の空のオブジェクト
    const isEditing = useIsEditing() // 編集モードの状態管理

    // 編集モードから通常モード（新規登録の画面）へ戻す
    const backToRegMode = () => {
        toggleEditMode(false);
        resetNewTodo();
    }
</script>
<template>
    <div>
        <!-- 新規または編集Todoの登録フォーム -->
        <table class="table-for-input" :class="{ 'table-for-update' : isEditing }">
            <tbody>
                <tr>
                    <th colspan="2">
                        <h4 :class="{ 'editing-title' : isEditing }" v-if="isEditing">
                            [Todo No. {{ newTodo.id }} を編集中]
                        </h4>
                    </th>
                </tr>
                <tr>
                    <th><label for="title">Todo Title: </label></th>
                    <td>
                        <input
                            id="title"
                            name="title"
                            v-model="newTodo.title"
                            placeholder="Type in Todo Title"
                        />
                    </td>
                </tr>
                <tr>
                    <th><label for="detail">Detail: </label></th>
                    <td>
                        <textarea
                            id="detail"
                            name="detail"
                            v-model="newTodo.detail"
                            placeholder="Type in Detail"
                        ></textarea>
                    </td>
                </tr>
                <tr>
                    <th><label for="deadline">Deadline: </label></th>
                    <td>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            v-model="newTodo.deadline"
                            placeholder="Type in Deadline"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="buttons">
            <button 
                class="btn-input-table btn-add-update"
                :class="{ 'btn-update' : isEditing }"
                @click="saveTodo">
                    {{ isEditing ? 'Update' : 'Add Todo' }}
            </button>
            <button class="btn-input-table btn-back-to-reg-mode" v-if="isEditing" @click="backToRegMode">Back to Register Mode</button>
        </div>
    </div>
</template>

<style scoped>
.table-for-input {
    margin: 2rem auto 1rem;
    width: 50%;
}
.table-for-input th {
    width: 20%;
    text-align: right;
}
.table-for-input td,
.table-for-input td input,
.table-for-input td textarea {
    width: 90%;
    border-radius: 4px;
    margin: 0.2rem 0;
}
.table-for-input td,
.table-for-input td input {
    min-height: 1.5rem;
}
.table-for-input td textarea {
    resize: vertical;
    min-height: 3rem;
    max-height: 240px;
}
.editing-title {
    text-align: center;
    border-bottom: 1px solid rgba(100,100,100,0.2);
    padding-bottom: 0.4rem;
    margin: 0.4rem;
}
.table-for-update {
    background-color: #fff7e1;
    border-radius: 8px
}
#deadline{
    width: 35%;
}
.buttons{
    margin-top: 1rem;
    margin: 0 auto;
    text-align: center;
}
.btn-input-table {
    font-weight: bold;
    border-radius: 4px;
    padding: 0.5rem 2rem;
    margin: 0.5rem;
    display: inline-block;
}
.btn-add-update {
    border: 2px solid rgba(0, 100, 200, 0.822);
}
.btn-add-update:hover {
    background-color: rgba(0, 100, 200, 0.822);
    color: aliceblue;
    transition: 0.3s;
}
.btn-update {
    background-color: bisque;
    border: 2px solid bisque;
}
.btn-update:hover {
    background-color: #fff;
    color: #333333;
}
.btn-back-to-reg-mode {
    border: 2px solid rgba(100, 100, 100, 0.822);
}
.btn-back-to-reg-mode:hover {
    background-color: rgba(100, 100, 100, 0.822);
    color: aliceblue;
    transition: 0.3s;
}
</style>